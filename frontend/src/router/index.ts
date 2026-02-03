import { createRouter, createWebHistory } from 'vue-router'
import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LandingView from '../views/LandingView.vue'
import { useAuthStore } from '../stores/auth'
import { head } from '../head'
import AppLayout from '../layouts/AppLayout.vue'
import MarketingLayout from '../layouts/MarketingLayout.vue'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    description?: string
    robots?: string
    requiresAuth?: boolean
    requiresGuest?: boolean
    redirectIfAuth?: boolean
  }
}

const defaultTitle = 'Blood Pressure Tracker'
const defaultDescription =
  'Track, review, and understand your blood pressure readings with clear trends and history.'

function applyRouteMeta(to: RouteLocationNormalized) {
  if (typeof window === 'undefined') return

  const title = to.meta.title || defaultTitle
  const description = to.meta.description || defaultDescription
  const robots = to.meta.robots || 'index, follow'
  const canonicalUrl = new URL(to.path, window.location.origin).toString()

  head.push({
    title,
    meta: [
      { name: 'description', content: description, key: 'description' },
      { name: 'robots', content: robots, key: 'robots' },
      { property: 'og:type', content: 'website', key: 'og:type' },
      { property: 'og:title', content: title, key: 'og:title' },
      { property: 'og:description', content: description, key: 'og:description' },
      { property: 'og:url', content: canonicalUrl, key: 'og:url' },
      { name: 'twitter:card', content: 'summary', key: 'twitter:card' },
      { name: 'twitter:title', content: title, key: 'twitter:title' },
      { name: 'twitter:description', content: description, key: 'twitter:description' },
    ],
    link: [{ rel: 'canonical', href: canonicalUrl, key: 'canonical' }],
  })
}

export const routes = [
  {
    path: '/',
    component: MarketingLayout,
    children: [
      {
        path: '',
        name: 'landing',
        displayName: 'Landing',
        component: LandingView,
        meta: {
          title: 'Blood Pressure Tracker | Track readings over time',
          description:
            'A simple blood pressure tracker with trend insights, history, and secure access from any device.',
          redirectIfAuth: true,
        },
      },
    ],
  },
  {
    path: '/',
    component: AppLayout,
    children: [
      {
        path: 'app',
        name: 'app',
        displayName: 'Home',
        component: HomeView,
        meta: {
          requiresAuth: true,
          title: 'Your Dashboard | Blood Pressure Tracker',
          description:
            'View recent readings, add new entries, and keep your blood pressure history organized.',
          robots: 'noindex, nofollow',
        },
      },
      {
        path: 'history',
        name: 'history',
        displayName: 'History',
        component: () => import('../views/HistoryView.vue'),
        meta: {
          requiresAuth: true,
          title: 'Reading History | Blood Pressure Tracker',
          description: 'Review trends and compare blood pressure readings over time.',
          robots: 'noindex, nofollow',
        },
      },
      {
        path: 'login',
        name: 'login',
        displayName: 'Login',
        component: () => import('../views/LoginView.vue'),
        meta: {
          requiresGuest: true,
          title: 'Sign In | Blood Pressure Tracker',
          description: 'Securely sign in to access your blood pressure dashboard.',
          robots: 'noindex, nofollow',
        },
      },
      {
        path: 'register',
        name: 'register',
        displayName: 'Register',
        component: () => import('../views/RegisterView.vue'),
        meta: {
          requiresGuest: true,
          title: 'Create Account | Blood Pressure Tracker',
          description: 'Create a free account to start tracking your blood pressure.',
          robots: 'noindex, nofollow',
        },
      },
    ],
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
    const redirectIfAuth = to.matched.some((record) => record.meta.redirectIfAuth)

    // If route requires authentication and user is not authenticated
    if (requiresAuth && !authStore.isLoggedIn) {
      // Redirect to login, preserving the intended destination
      next({ name: 'login', query: { redirect: to.fullPath } })
      return
    }

    // Keep authenticated users out of guest-only/public entry routes.
    if ((requiresGuest || redirectIfAuth) && authStore.isLoggedIn) {
      next({ name: 'app' })
      return
    }

    // Allow navigation
    next()
  },
)

router.afterEach((to) => {
  if (typeof document === 'undefined') return
  applyRouteMeta(to)
})

export default router
