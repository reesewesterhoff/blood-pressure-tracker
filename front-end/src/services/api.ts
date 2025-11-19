/**
 * API Service
 *
 * Centralized HTTP client for making API requests to the backend.
 * Handles request/response formatting, error handling, and authentication.
 */

import { getApiUrl } from '@/config/api'
import type { BloodPressureReading } from '@/types/BloodPressure'

/**
 * Standard API response structure
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  message?: string
  data?: T
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
}
