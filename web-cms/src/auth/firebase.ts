import { isDevAuth } from './devAuth';
import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onIdTokenChanged,
  type UserCredential,
  type Auth,
} from 'firebase/auth';

/**
 * Provide top-level exports. In DEV AUTH mode we return no-op shims and never
 * initialize Firebase (to avoid invalid API key errors). In normal mode we
 * initialize Firebase and wire real implementations.
 */
let app: FirebaseApp | undefined;
let auth: Auth | undefined;

let signInWithGoogleImpl: () => Promise<UserCredential>;
let signOutImpl: () => Promise<void>;
let getIdTokenImpl: (forceRefresh?: boolean) => Promise<string | null>;
let onTokenChangedImpl: (callback: (token: string | null) => void) => () => void;

if (isDevAuth) {
  // Dev auth mode: do not init Firebase
  app = undefined as unknown as FirebaseApp;
  auth = undefined as unknown as Auth;

  signInWithGoogleImpl = async () => {
    throw new Error('Google sign-in is disabled in DEV auth mode');
  };
  signOutImpl = async () => {
    // no-op
  };
  getIdTokenImpl = async () => {
    // dev mode uses local dev token, not Firebase
    return null;
  };
  onTokenChangedImpl = (callback: (token: string | null) => void) => {
    // Immediately signal "no token" so consumers can stop loading state
    setTimeout(() => callback(null), 0);
    return () => {};
  };
} else {
  // Firebase config from environment
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
    appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
  };

  // Initialize Firebase
  const _app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  const _auth = getAuth(_app);
  const googleProvider = new GoogleAuthProvider();

  app = _app;
  auth = _auth;

  signInWithGoogleImpl = () => signInWithPopup(_auth, googleProvider);
  signOutImpl = () => fbSignOut(_auth);
  getIdTokenImpl = async (forceRefresh = false) => {
    const user = _auth.currentUser;
    if (!user) return null;
    return user.getIdToken(forceRefresh);
  };
  onTokenChangedImpl = (callback: (token: string | null) => void) =>
    onIdTokenChanged(_auth, async (user) => {
      if (!user) {
        callback(null);
        return;
      }
      const token = await user.getIdToken();
      callback(token);
    });
}

export { app, auth };

export function signInWithGoogle(): Promise<UserCredential> {
  return signInWithGoogleImpl();
}

export function signOut(): Promise<void> {
  return signOutImpl();
}

export function getIdToken(forceRefresh = false): Promise<string | null> {
  return getIdTokenImpl(forceRefresh);
}

export function onTokenChanged(callback: (token: string | null) => void): () => void {
  return onTokenChangedImpl(callback);
}
