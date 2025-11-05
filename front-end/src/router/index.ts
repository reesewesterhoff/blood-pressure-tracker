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
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
