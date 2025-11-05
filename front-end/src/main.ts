import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { initTheme } from './composables/useTheme'

// Initialize theme before mounting
// This ensures the dark class is applied immediately and prevents flash
initTheme()

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
