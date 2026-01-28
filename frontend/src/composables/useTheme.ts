import { ref, watch } from 'vue'

const STORAGE_KEY = 'theme-override'

// User's explicit preference (null = use system, boolean = user override)
const userOverride = ref<boolean | null>(
  typeof window !== 'undefined'
    ? localStorage.getItem(STORAGE_KEY) === 'true'
      ? true
      : localStorage.getItem(STORAGE_KEY) === 'false'
        ? false
        : null
    : null,
)

// Current theme state (reactive)
const isDark = ref(false)

// Get system preference
function getSystemPreference(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

// Apply dark mode class to document
function applyDarkClass(shouldBeDark: boolean) {
  if (shouldBeDark) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

// Update theme based on user override or system preference
function updateTheme() {
  const shouldBeDark = userOverride.value !== null ? userOverride.value : getSystemPreference()
  isDark.value = shouldBeDark
  applyDarkClass(shouldBeDark)
}

// Media query listener for system preference changes
let mediaQuery: MediaQueryList | null = null

function setupMediaQueryListener() {
  if (mediaQuery) {
    mediaQuery.removeEventListener('change', updateTheme)
  }

  // Only listen to system changes if user hasn't overridden
  if (userOverride.value === null) {
    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', updateTheme)
  } else {
    mediaQuery = null
  }
}

// Initialize theme (call this in main.ts before mounting)
export function initTheme() {
  updateTheme()
  setupMediaQueryListener()

  // Watch for changes to user override or system preference
  watch(userOverride, () => {
    updateTheme()
    setupMediaQueryListener()
  })
}

/**
 * Composable for managing theme state (light/dark)
 * Respects system preference by default, but allows user override via toggle
 */
export function useTheme() {
  // Toggle between light and dark (overrides system preference)
  function toggle() {
    // Get current state - if user has override, use that, otherwise use system
    const currentDark = userOverride.value !== null ? userOverride.value : getSystemPreference()
    const newValue = !currentDark

    // Set the override - the watcher will handle updating the theme
    userOverride.value = newValue

    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, String(newValue))
    }
  }

  return {
    isDark,
    toggle,
  }
}
