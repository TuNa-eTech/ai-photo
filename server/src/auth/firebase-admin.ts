import { App, cert, getApp, getApps, initializeApp } from 'firebase-admin/app';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { Logger } from '@nestjs/common';

const logger = new Logger('FirebaseAdmin');

/**
 * Initialize and return a singleton Firebase Admin App instance.
 *
 * Credentials loading priority:
 * 1. firebase-adminsdk.json file in server root (if exists)
 * 2. Environment variables (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY)
 * 3. Application Default Credentials (GOOGLE_APPLICATION_CREDENTIALS env var)
 */
export function initFirebaseAdmin(): App {
  if (getApps().length > 0) {
    return getApp();
  }

  logger.log('Initializing Firebase Admin SDK...');

  // 1. Try to load from firebase-adminsdk.json file
  const serviceAccountPath = join(process.cwd(), 'firebase-adminsdk.json');
  if (existsSync(serviceAccountPath)) {
    try {
      const serviceAccount = JSON.parse(
        readFileSync(serviceAccountPath, 'utf8'),
      );
      logger.log(`Loading Firebase credentials from ${serviceAccountPath}`);
      logger.log(`Firebase Project ID: ${serviceAccount.project_id}`);
      const app = initializeApp({
        credential: cert(serviceAccount),
      });
      logger.log(
        '✅ Firebase Admin SDK initialized successfully via JSON file',
      );
      return app;
    } catch (error) {
      logger.error(
        `Failed to load firebase-adminsdk.json: ${error instanceof Error ? error.message : error}`,
      );
      // Continue to next method
    }
  } else {
    logger.debug(`firebase-adminsdk.json not found at ${serviceAccountPath}`);
  }

  // 2. Try environment variables
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;
  const privateKey = rawPrivateKey
    ? rawPrivateKey.replace(/\\n/g, '\n')
    : undefined;

  if (projectId && clientEmail && privateKey) {
    logger.log('Loading Firebase credentials from environment variables');
    logger.log(`Firebase Project ID: ${projectId}`);
    const app = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
    logger.log(
      '✅ Firebase Admin SDK initialized successfully via environment variables',
    );
    return app;
  } else {
    logger.debug('Firebase environment variables not found');
  }

  // 3. Attempt to use ADC (e.g., GOOGLE_APPLICATION_CREDENTIALS)
  try {
    logger.log('Attempting to use Application Default Credentials (ADC)');
    const app = initializeApp();
    logger.log('✅ Firebase Admin SDK initialized successfully via ADC');
    return app;
  } catch (error) {
    logger.error(
      `Failed to initialize Firebase Admin SDK: ${error instanceof Error ? error.message : error}`,
    );
    throw error;
  }
}
