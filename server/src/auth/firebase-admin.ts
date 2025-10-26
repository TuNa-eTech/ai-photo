import { App, cert, getApp, getApps, initializeApp } from 'firebase-admin/app';

/**
 * Initialize and return a singleton Firebase Admin App instance.
 * Credentials are loaded from environment variables:
 * - FIREBASE_PROJECT_ID
 * - FIREBASE_CLIENT_EMAIL
 * - FIREBASE_PRIVATE_KEY (use &#92;n for newlines in env)
 * 
 * Falls back to Application Default Credentials if explicit vars are not provided.
 */
export function initFirebaseAdmin(): App {
  if (getApps().length > 0) {
    return getApp();
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;
  const privateKey = rawPrivateKey ? rawPrivateKey.replace(/\\n/g, '\n') : undefined;

  if (projectId && clientEmail && privateKey) {
    return initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  }

  // Attempt to use ADC (e.g., GOOGLE_APPLICATION_CREDENTIALS)
  return initializeApp();
}
