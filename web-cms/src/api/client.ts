/**
 * Axios HTTP Client with Envelope handling
 * 
 * Features:
 * - Automatic Bearer token injection
 * - Envelope response unwrapping
 * - Single 401 retry with token refresh
 * - Request/Response interceptors
 * 
 * Based on: .documents/platform-guides/web-cms.md
 */

import axios, { type AxiosInstance, AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { type Envelope, isSuccessResponse, isErrorResponse } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

/**
 * Custom error class for API errors
 */
export class APIClientError extends Error {
  code: string
  details?: Record<string, unknown>
  statusCode?: number

  constructor(
    message: string,
    code: string,
    details?: Record<string, unknown>,
    statusCode?: number
  ) {
    super(message)
    this.name = 'APIClientError'
    this.code = code
    this.details = details
    this.statusCode = statusCode
  }
}

/**
 * Token provider interface
 * This will be implemented by the auth module
 */
export interface TokenProvider {
  getToken(): Promise<string | null>
  refreshToken?(): Promise<string | null>
}

/**
 * API Client class
 */
class APIClient {
  private axiosInstance: AxiosInstance
  private tokenProvider: TokenProvider | null = null
  private isRefreshing = false
  private failedRequestsQueue: Array<{
    resolve: (token: string) => void
    reject: (error: Error) => void
  }> = []

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    })

    this.setupInterceptors()
  }

  /**
   * Set token provider (called by auth module)
   */
  setTokenProvider(provider: TokenProvider): void {
    this.tokenProvider = provider
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor: inject Bearer token
    this.axiosInstance.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        if (this.tokenProvider) {
          const token = await this.tokenProvider.getToken()
          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`
          }
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor: handle envelope and 401
    this.axiosInstance.interceptors.response.use(
      (response) => {
        // Unwrap envelope response
        const envelope = response.data as Envelope<unknown>

        if (isSuccessResponse(envelope)) {
          // Return the data directly
          return { ...response, data: envelope.data }
        }

        if (isErrorResponse(envelope)) {
          // Convert envelope error to exception
          throw new APIClientError(
            envelope.error.message,
            envelope.error.code,
            envelope.error.details,
            response.status
          )
        }

        // Fallback: return as-is
        return response
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean
        }

        // Handle 401 with single retry
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // Wait for refresh to complete
            return new Promise((resolve, reject) => {
              this.failedRequestsQueue.push({ resolve, reject })
            })
              .then((token) => {
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${token}`
                }
                return this.axiosInstance(originalRequest)
              })
              .catch((err) => {
                return Promise.reject(err)
              })
          }

          originalRequest._retry = true
          this.isRefreshing = true

          try {
            // Try to refresh token
            const newToken = await this.tokenProvider?.refreshToken?.()

            if (newToken) {
              // Retry all failed requests with new token
              this.failedRequestsQueue.forEach(({ resolve }) => {
                resolve(newToken)
              })

              this.failedRequestsQueue = []

              // Retry original request
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`
              }

              return this.axiosInstance(originalRequest)
            }
          } catch (refreshError) {
            // Refresh failed, reject all queued requests
            this.failedRequestsQueue.forEach(({ reject }) => {
              reject(refreshError as Error)
            })

            this.failedRequestsQueue = []
            return Promise.reject(refreshError)
          } finally {
            this.isRefreshing = false
          }
        }

        // Handle envelope error in error response
        if (error.response?.data) {
          const envelope = error.response.data as Envelope<unknown>
          if (isErrorResponse(envelope)) {
            throw new APIClientError(
              envelope.error.message,
              envelope.error.code,
              envelope.error.details,
              error.response.status
            )
          }
        }

        // Rethrow original error
        throw error
      }
    )
  }

  /**
   * GET request
   */
  async get<T>(url: string, config?: Parameters<typeof this.axiosInstance.get>[1]): Promise<T> {
    const response = await this.axiosInstance.get<T>(url, config)
    return response.data
  }

  /**
   * POST request
   */
  async post<T>(
    url: string,
    data?: unknown,
    config?: Parameters<typeof this.axiosInstance.post>[2]
  ): Promise<T> {
    const response = await this.axiosInstance.post<T>(url, data, config)
    return response.data
  }

  /**
   * PUT request
   */
  async put<T>(
    url: string,
    data?: unknown,
    config?: Parameters<typeof this.axiosInstance.put>[2]
  ): Promise<T> {
    const response = await this.axiosInstance.put<T>(url, data, config)
    return response.data
  }

  /**
   * PATCH request
   */
  async patch<T>(
    url: string,
    data?: unknown,
    config?: Parameters<typeof this.axiosInstance.patch>[2]
  ): Promise<T> {
    const response = await this.axiosInstance.patch<T>(url, data, config)
    return response.data
  }

  /**
   * DELETE request
   */
  async delete<T>(url: string, config?: Parameters<typeof this.axiosInstance.delete>[1]): Promise<T> {
    const response = await this.axiosInstance.delete<T>(url, config)
    return response.data
  }

  /**
   * Get raw axios instance (for special cases like file upload)
   */
  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance
  }
}

// Export singleton instance
export const apiClient = new APIClient()

