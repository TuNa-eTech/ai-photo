import { initializeApp, getApp, getApps } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onIdTokenChanged,
  type UserCredential,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

/**
 * Trigger Google sign-in using a popup.
 */
export async function signInWithGoogle(): Promise<UserCredential> {
  return signInWithPopup(auth, googleProvider);
}

/**
 * Sign out current user.
 */
export async function signOut(): Promise<void> {
  await fbSignOut(auth);
}

/**
 * Get current user's ID token. Returns null if not authenticated.
 */
export async function getIdToken(forceRefresh = false): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken(forceRefresh);
}

/**
 * Subscribe to ID token changes (token refresh, sign-in/out).
 * Returns an unsubscribe function.
 */
export function onTokenChanged(callback: (token: string | null) => void): () => void {
  return onIdTokenChanged(auth, async (user) => {
    if (!user) {
      callback(null);
      return;
    }
    const token = await user.getIdToken();
    callback(token);
  });
}

export { app, auth };
