import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { auth, onTokenChanged, signInWithGoogle, signOut, getIdToken } from './firebase';
import { isDevAuth } from './devAuth';
import type { User } from 'firebase/auth';

type AuthContextValue = {
  user: User | null;
  idToken: string | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshToken: (force?: boolean) => Promise<string | null>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // In dev auth mode, do NOT touch Firebase objects. Provide a stable, non-throwing context.
  const [user, setUser] = useState<User | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isDevAuth) {
      // Immediately mark loading as false; dev auth uses local token and ProtectedRoute
      setLoading(false);
      setUser(null);
      setIdToken(null);
      return;
    }
    // Firebase mode: subscribe to token changes
    const unsub = onTokenChanged(async (token) => {
      // auth is defined only in non-dev mode
      setUser(auth ? auth.currentUser : null);
      setIdToken(token);
      setLoading(false);
    });
    return () => {
      try {
        unsub();
      } catch {
        // ignore
      }
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      idToken,
      loading,
      async signIn() {
        if (isDevAuth) {
          // Dev auth login is handled in Login.tsx via devAuth; no Firebase popup here.
          return;
        }
        await signInWithGoogle();
        // token will be updated by onTokenChanged listener
      },
      async signOut() {
        if (isDevAuth) {
          // Dev auth logout handled in ProtectedRoute via clearDevToken
          return;
        }
        await signOut();
      },
      async refreshToken(force = true) {
        if (isDevAuth) {
          setIdToken(null);
          return null;
        }
        const token = await getIdToken(force);
        setIdToken(token);
        return token;
      },
    }),
    [user, idToken, loading],
  );

  return React.createElement(AuthContext.Provider, { value }, children);
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
