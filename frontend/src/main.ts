import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { initTheme } from './composables/useTheme'
import { useAuthStore } from './stores/auth'

// Initialize theme before mounting
// This ensures the dark class is applied immediately and prevents flash
initTheme()

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Initialize authentication check before mounting
// This ensures we know the auth state before the router guards run
const authStore = useAuthStore()
authStore.checkAuth().then(() => {
  app.mount('#app')
})
