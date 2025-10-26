/**
 * API Response Envelope Types
 * 
 * Based on: .documents/api/standards.md
 * All API responses follow the envelope pattern for consistency
 */

export interface APIError {
  code: string
  message: string
  details?: Record<string, unknown>
}

export interface Meta {
  requestId: string
  timestamp: string
  pagination?: Pagination
}

export interface Pagination {
  page?: number
  perPage?: number
  total?: number
  totalPages?: number
  nextCursor?: string
}

export interface Envelope<T> {
  success: boolean
  data: T | null
  error: APIError | null
  meta: Meta
}

/**
 * Type guard to check if response is successful
 */
export function isSuccessResponse<T>(
  envelope: Envelope<T>
): envelope is Envelope<T> & { success: true; data: T } {
  return envelope.success === true && envelope.data !== null
}

/**
 * Type guard to check if response is error
 */
export function isErrorResponse<T>(
  envelope: Envelope<T>
): envelope is Envelope<T> & { success: false; error: APIError } {
  return envelope.success === false && envelope.error !== null
}

