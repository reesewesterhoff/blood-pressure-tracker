/**
 * API Configuration
 *
 * The base URL for the backend API server.
 * Can be configured via environment variable VITE_API_BASE_URL.
 * Defaults to http://localhost:3000 for local development.
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

/**
 * Get the full API URL for a given endpoint
 */
export function getApiUrl(endpoint: string): string {
  // Ensure endpoint starts with /
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  // Remove trailing slash from base URL if present
  const baseUrl = API_BASE_URL.replace(/\/$/, '')
  return `${baseUrl}${normalizedEndpoint}`
}

/**
 * Get the Google OAuth authentication URL
 */
export function getGoogleAuthUrl(): string {
  return getApiUrl('/auth/google')
}
