/**
 * API Service
 *
 * Centralized HTTP client for making API requests to the backend.
 * Handles request/response formatting, error handling, and authentication.
 */

import { getApiUrl } from '@/config/api'
import type { BloodPressureReading, BloodPressureStats } from '@/types/BloodPressure'
import type { User } from '@/types/User'

/**
 * Standard API response structure
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  message?: string
  data?: T
  errors?: string[]
}

/**
 * API Error class for handling API-specific errors
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: ApiResponse,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Make an HTTP request to the API
 */
async function request<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const url = getApiUrl(endpoint)

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    // Include credentials for session-based authentication (cookies)
    credentials: 'include',
  }

  try {
    const response = await fetch(url, config)

    // Parse JSON response
    let data: ApiResponse<T>
    try {
      data = await response.json()
    } catch {
      // If response is not JSON, create a generic error response
      throw new ApiError(
        `Invalid response format from server (status ${response.status})`,
        response.status,
      )
    }

    // Check if the response indicates an error
    if (!response.ok) {
      throw new ApiError(
        data.message || `Request failed with status ${response.status}`,
        response.status,
        data,
      )
    }

    // Check if the API response structure indicates failure
    if (!data.success) {
      throw new ApiError(data.message || 'Request failed', response.status, data)
    }

    return data
  } catch (error) {
    // Re-throw ApiError as-is
    if (error instanceof ApiError) {
      throw error
    }

    // Handle network errors and other fetch failures
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiError('Network error: Unable to connect to the server', 0)
    }

    // Handle other unexpected errors
    throw new ApiError(error instanceof Error ? error.message : 'An unexpected error occurred', 0)
  }
}

/**
 * API service methods for authentication
 */
export const authApi = {
  /**
   * Register a new user with email and password
   */
  async register(
    email: string,
    password: string,
    firstName: string,
    lastName?: string,
  ): Promise<ApiResponse<User>> {
    return request<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, firstName, lastName }),
    })
  },

  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<ApiResponse<User>> {
    return request<User>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  },

  /**
   * Logout the current user
   */
  async logout(): Promise<ApiResponse> {
    return request('/auth/logout', {
      method: 'GET',
    })
  },

  /**
   * Get the current authenticated user
   */
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return request<User>('/auth/user', {
      method: 'GET',
    })
  },
}

/**
 * API service methods for blood pressure readings
 */
export const readingsApi = {
  /**
   * Submit a new blood pressure reading
   */
  async createBloodPressureReading(reading: BloodPressureReading): Promise<ApiResponse> {
    return request('/api/readings', {
      method: 'POST',
      body: JSON.stringify({
        systolic: reading.systolic,
        diastolic: reading.diastolic,
      }),
    })
  },

  /**
   * Get all blood pressure readings for the logged-in user
   */
  async getBloodPressureReadings(): Promise<ApiResponse<BloodPressureReading[]>> {
    return request<BloodPressureReading[]>('/api/readings', {
      method: 'GET',
    })
  },

  /**
   * Get average blood pressure statistics for the logged-in user
   */
  async getAverageBloodPressure(): Promise<ApiResponse<BloodPressureStats>> {
    return request<BloodPressureStats>('/api/readings/average', {
      method: 'GET',
    })
  },
}
