import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

export const routes = [
  {
    path: '/',
    name: 'home',
    displayName: 'Home',
    component: HomeView,
  },
  {
    path: '/history',
    name: 'history',
    displayName: 'History',
    component: () => import('../views/HistoryView.vue'),
  },
  {
    path: '/login',
    name: 'login',
    displayName: 'Login',
    component: () => import('../views/LoginView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
