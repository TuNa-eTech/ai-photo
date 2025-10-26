/**
 * DevAuth - Development Authentication
 * 
 * Simple token-based authentication for local development
 * bypasses Firebase when VITE_DEV_AUTH=1
 * 
 * Based on: .documents/tech.md
 */

import type { User } from '../types'

export interface DevAuthConfig {
  enabled: boolean
  token: string
}

/**
 * Get DevAuth config from environment
 */
export function getDevAuthConfig(): DevAuthConfig {
  return {
    enabled: import.meta.env.VITE_DEV_AUTH === '1' || import.meta.env.VITE_DEV_AUTH === 'true',
    token: import.meta.env.VITE_DEV_AUTH_TOKEN || 'dev',
  }
}

/**
 * Check if DevAuth is enabled
 */
export function isDevAuthEnabled(): boolean {
  return getDevAuthConfig().enabled
}

/**
 * Get DevAuth token
 */
export function getDevAuthToken(): string | null {
  const config = getDevAuthConfig()
  return config.enabled ? config.token : null
}

/**
 * Mock user for DevAuth
 */
export function getDevAuthUser(): User {
  return {
    uid: 'dev-user-id',
    email: 'dev@example.com',
    displayName: 'Dev User',
    photoURL: null,
  }
}

/**
 * Simulate login with DevAuth
 */
export function devAuthLogin(): Promise<User> {
  return Promise.resolve(getDevAuthUser())
}

/**
 * Simulate logout with DevAuth
 */
export function devAuthLogout(): Promise<void> {
  return Promise.resolve()
}

