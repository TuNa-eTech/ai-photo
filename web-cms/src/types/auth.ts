/**
 * Authentication Types
 * 
 * Supports both Firebase Auth (production) and DevAuth (local development)
 */

/**
 * User information from Firebase
 */
export interface User {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
}

/**
 * Auth state
 */
export interface AuthState {
  user: User | null
  loading: boolean
  error: Error | null
}

/**
 * Dev Auth mode (for local development)
 */
export interface DevAuthConfig {
  enabled: boolean
  token: string
}

