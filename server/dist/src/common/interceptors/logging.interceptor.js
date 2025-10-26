"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggingInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
let LoggingInterceptor = class LoggingInterceptor {
    logger = new common_1.Logger('HTTP');
    intercept(context, next) {
        const req = context.switchToHttp().getRequest();
        const res = context.switchToHttp().getResponse();
        const { method, url, body, headers } = req;
        const userAgent = headers['user-agent'] || 'Unknown';
        const ip = headers['x-forwarded-for'] || req.connection.remoteAddress || 'Unknown';
        const now = Date.now();
        this.logger.log(`→ ${method} ${url} - ${ip} - ${userAgent}`);
        if (['POST', 'PUT', 'PATCH'].includes(method) && body) {
            const sanitizedBody = this.sanitizeBody(body);
            this.logger.debug(`  Body: ${JSON.stringify(sanitizedBody)}`);
        }
        return next.handle().pipe((0, operators_1.tap)({
            next: (data) => {
                const responseTime = Date.now() - now;
                const statusCode = res.statusCode;
                this.logger.log(`← ${method} ${url} - ${statusCode} - ${responseTime}ms`);
            },
            error: (error) => {
                const responseTime = Date.now() - now;
                const statusCode = error.status || 500;
                this.logger.error(`← ${method} ${url} - ${statusCode} - ${responseTime}ms - ERROR: ${error.message}`);
            },
        }));
    }
    sanitizeBody(body) {
        if (!body || typeof body !== 'object')
            return body;
        const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'private_key', 'privateKey'];
        const sanitized = { ...body };
        for (const field of sensitiveFields) {
            if (field in sanitized) {
                sanitized[field] = '***REDACTED***';
            }
        }
        return sanitized;
    }
};
exports.LoggingInterceptor = LoggingInterceptor;
exports.LoggingInterceptor = LoggingInterceptor = __decorate([
    (0, common_1.Injectable)()
], LoggingInterceptor);
//# sourceMappingURL=logging.interceptor.js.map