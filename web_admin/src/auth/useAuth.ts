import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { auth, onTokenChanged, signInWithGoogle, signOut, getIdToken } from './firebase';
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
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Subscribe to token changes and auth state
  useEffect(() => {
    const unsub = onTokenChanged(async (token) => {
      setUser(auth.currentUser);
      setIdToken(token);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      idToken,
      loading,
      async signIn() {
        await signInWithGoogle();
        // token will be updated by onTokenChanged listener
      },
      async signOut() {
        await signOut();
        // state will be updated by onTokenChanged
      },
      async refreshToken(force = true) {
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
