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
    async canActivate(context) {
        const req = context.switchToHttp().getRequest();
        const devEnabled = parseBool(process.env.DEV_AUTH_ENABLED);
        const expected = (process.env.DEV_AUTH_TOKEN || '').trim();
        const auth = (req.headers['authorization'] || req.headers['Authorization']);
        if (!auth || !auth.startsWith('Bearer ')) {
            throw new common_1.UnauthorizedException({ code: 'unauthorized', message: 'Missing or invalid Authorization header' });
        }
        const token = auth.substring('Bearer '.length).trim();
        if (devEnabled) {
            if (!expected || token !== expected) {
                throw new common_1.UnauthorizedException({ code: 'unauthorized', message: 'Invalid token' });
            }
            return true;
        }
        try {
            (0, firebase_admin_1.initFirebaseAdmin)();
            const authAdmin = (0, auth_1.getAuth)();
            await authAdmin.verifyIdToken(token);
            return true;
        }
        catch {
            throw new common_1.UnauthorizedException({ code: 'unauthorized', message: 'Invalid or expired token' });
        }
    }
};
exports.BearerAuthGuard = BearerAuthGuard;
exports.BearerAuthGuard = BearerAuthGuard = __decorate([
    (0, common_1.Injectable)()
], BearerAuthGuard);
//# sourceMappingURL=bearer-auth.guard.js.map