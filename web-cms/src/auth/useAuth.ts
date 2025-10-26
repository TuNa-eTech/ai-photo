/**
 * useAuth Hook
 * 
 * Unified authentication hook supporting both Firebase and DevAuth
 * Provides auth state, login/logout methods, and token access
 */

import { useState, useEffect, useCallback } from 'react'
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth'
import { getFirebaseAuth } from './firebase'
import {
  isDevAuthEnabled,
  getDevAuthToken,
  getDevAuthUser,
  devAuthLogin,
  devAuthLogout,
} from './devAuth'
import { apiClient, type TokenProvider } from '../api/client'
import type { User as UserType } from '../types'

export interface UseAuthReturn {
  user: UserType | null
  loading: boolean
  error: Error | null
  login: () => Promise<void>
  logout: () => Promise<void>
  getToken: () => Promise<string | null>
}

/**
 * Convert Firebase User to our User type
 */
function mapFirebaseUser(firebaseUser: FirebaseUser): UserType {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
  }
}

/**
 * useAuth hook implementation
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<UserType | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  const devAuthMode = isDevAuthEnabled()

  /**
   * Get current authentication token
   */
  const getToken = useCallback(async (): Promise<string | null> => {
    try {
      if (devAuthMode) {
        return getDevAuthToken()
      }

      const auth = getFirebaseAuth()
      const currentUser = auth.currentUser

      if (!currentUser) {
        return null
      }

      // Get fresh ID token from Firebase
      const token = await currentUser.getIdToken()
      return token
    } catch (err) {
      console.error('Failed to get token:', err)
      return null
    }
  }, [devAuthMode])

  /**
   * Refresh token (for 401 retry logic)
   */
  const refreshToken = useCallback(async (): Promise<string | null> => {
    try {
      if (devAuthMode) {
        return getDevAuthToken()
      }

      const auth = getFirebaseAuth()
      const currentUser = auth.currentUser

      if (!currentUser) {
        return null
      }

      // Force refresh ID token
      const token = await currentUser.getIdToken(true)
      return token
    } catch (err) {
      console.error('Failed to refresh token:', err)
      return null
    }
  }, [devAuthMode])

  /**
   * Login with Google (Firebase) or DevAuth
   */
  const login = useCallback(async (): Promise<void> => {
    try {
      setError(null)
      setLoading(true)

      if (devAuthMode) {
        // DevAuth login
        const devUser = await devAuthLogin()
        setUser(devUser)
      } else {
        // Firebase Google Sign-In
        const auth = getFirebaseAuth()
        const provider = new GoogleAuthProvider()
        const result = await signInWithPopup(auth, provider)
        setUser(mapFirebaseUser(result.user))
      }
    } catch (err) {
      const error = err as Error
      setError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [devAuthMode])

  /**
   * Logout
   */
  const logout = useCallback(async (): Promise<void> => {
    try {
      setError(null)
      setLoading(true)

      if (devAuthMode) {
        // DevAuth logout
        await devAuthLogout()
        setUser(null)
      } else {
        // Firebase logout
        const auth = getFirebaseAuth()
        await signOut(auth)
        setUser(null)
      }
    } catch (err) {
      const error = err as Error
      setError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [devAuthMode])

  /**
   * Setup auth state listener
   */
  useEffect(() => {
    if (devAuthMode) {
      // DevAuth: check if user should be logged in
      const devUser = getDevAuthUser()
      setUser(devUser)
      setLoading(false)
      return
    }

    // Firebase: listen to auth state changes
    const auth = getFirebaseAuth()
    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        if (firebaseUser) {
          setUser(mapFirebaseUser(firebaseUser))
        } else {
          setUser(null)
        }
        setLoading(false)
      },
      (err) => {
        setError(err as Error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [devAuthMode])

  /**
   * Setup API client token provider
   */
  useEffect(() => {
    const tokenProvider: TokenProvider = {
      getToken,
      refreshToken,
    }

    apiClient.setTokenProvider(tokenProvider)
  }, [getToken, refreshToken])

  return {
    user,
    loading,
    error,
    login,
    logout,
    getToken,
  }
}

