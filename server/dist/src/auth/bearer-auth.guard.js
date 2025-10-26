"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BearerAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const auth_1 = require("firebase-admin/auth");
const firebase_admin_1 = require("./firebase-admin");
function parseBool(v) {
    if (typeof v === 'boolean')
        return v;
    if (typeof v === 'string') {
        const s = v.trim().toLowerCase();
        return s === '1' || s === 'true' || s === 'yes' || s === 'on';
    }
    return false;
}
let BearerAuthGuard = class BearerAuthGuard {
    logger = new common_1.Logger('BearerAuthGuard');
    async canActivate(context) {
        const req = context.switchToHttp().getRequest();
        const devEnabled = parseBool(process.env.DEV_AUTH_ENABLED);
        const expected = (process.env.DEV_AUTH_TOKEN || '').trim();
        const auth = (req.headers['authorization'] || req.headers['Authorization']);
        if (!auth || !auth.startsWith('Bearer ')) {
            this.logger.warn(`Missing or invalid Authorization header for ${req.url}`);
            throw new common_1.UnauthorizedException({ code: 'unauthorized', message: 'Missing or invalid Authorization header' });
        }
        const token = auth.substring('Bearer '.length).trim();
        if (devEnabled) {
            if (!expected || token !== expected) {
                this.logger.warn(`Invalid DevAuth token for ${req.url}`);
                throw new common_1.UnauthorizedException({ code: 'unauthorized', message: 'Invalid token' });
            }
            req.firebaseUid = 'dev-user-uid-123';
            this.logger.debug(`DevAuth: Authenticated as dev-user-uid-123 for ${req.url}`);
            return true;
        }
        try {
            (0, firebase_admin_1.initFirebaseAdmin)();
            const authAdmin = (0, auth_1.getAuth)();
            const decodedToken = await authAdmin.verifyIdToken(token);
            req.firebaseUid = decodedToken.uid;
            this.logger.debug(`Firebase Auth: Authenticated user ${decodedToken.uid} for ${req.url}`);
            return true;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`Firebase token verification failed for ${req.url}: ${errorMessage}`);
            throw new common_1.UnauthorizedException({ code: 'unauthorized', message: 'Invalid or expired token' });
        }
    }
};
exports.BearerAuthGuard = BearerAuthGuard;
exports.BearerAuthGuard = BearerAuthGuard = __decorate([
    (0, common_1.Injectable)()
], BearerAuthGuard);
//# sourceMappingURL=bearer-auth.guard.js.map