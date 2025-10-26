"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initFirebaseAdmin = initFirebaseAdmin;
const app_1 = require("firebase-admin/app");
function initFirebaseAdmin() {
    if ((0, app_1.getApps)().length > 0) {
        return (0, app_1.getApp)();
    }
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;
    const privateKey = rawPrivateKey ? rawPrivateKey.replace(/\\n/g, '\n') : undefined;
    if (projectId && clientEmail && privateKey) {
        return (0, app_1.initializeApp)({
            credential: (0, app_1.cert)({
                projectId,
                clientEmail,
                privateKey,
            }),
        });
    }
    return (0, app_1.initializeApp)();
}
//# sourceMappingURL=firebase-admin.js.map