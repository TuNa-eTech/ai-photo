"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initFirebaseAdmin = initFirebaseAdmin;
const app_1 = require("firebase-admin/app");
const fs_1 = require("fs");
const path_1 = require("path");
const common_1 = require("@nestjs/common");
const logger = new common_1.Logger('FirebaseAdmin');
function initFirebaseAdmin() {
    if ((0, app_1.getApps)().length > 0) {
        return (0, app_1.getApp)();
    }
    logger.log('Initializing Firebase Admin SDK...');
    const serviceAccountPath = (0, path_1.join)(process.cwd(), 'firebase-adminsdk.json');
    if ((0, fs_1.existsSync)(serviceAccountPath)) {
        try {
            const serviceAccount = JSON.parse((0, fs_1.readFileSync)(serviceAccountPath, 'utf8'));
            logger.log(`Loading Firebase credentials from ${serviceAccountPath}`);
            logger.log(`Firebase Project ID: ${serviceAccount.project_id}`);
            const app = (0, app_1.initializeApp)({
                credential: (0, app_1.cert)(serviceAccount),
            });
            logger.log('✅ Firebase Admin SDK initialized successfully via JSON file');
            return app;
        }
        catch (error) {
            logger.error(`Failed to load firebase-adminsdk.json: ${error instanceof Error ? error.message : error}`);
        }
    }
    else {
        logger.debug(`firebase-adminsdk.json not found at ${serviceAccountPath}`);
    }
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;
    const privateKey = rawPrivateKey ? rawPrivateKey.replace(/\\n/g, '\n') : undefined;
    if (projectId && clientEmail && privateKey) {
        logger.log('Loading Firebase credentials from environment variables');
        logger.log(`Firebase Project ID: ${projectId}`);
        const app = (0, app_1.initializeApp)({
            credential: (0, app_1.cert)({
                projectId,
                clientEmail,
                privateKey,
            }),
        });
        logger.log('✅ Firebase Admin SDK initialized successfully via environment variables');
        return app;
    }
    else {
        logger.debug('Firebase environment variables not found');
    }
    try {
        logger.log('Attempting to use Application Default Credentials (ADC)');
        const app = (0, app_1.initializeApp)();
        logger.log('✅ Firebase Admin SDK initialized successfully via ADC');
        return app;
    }
    catch (error) {
        logger.error(`Failed to initialize Firebase Admin SDK: ${error instanceof Error ? error.message : error}`);
        throw error;
    }
}
//# sourceMappingURL=firebase-admin.js.map