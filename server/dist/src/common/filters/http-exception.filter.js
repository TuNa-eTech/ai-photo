"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpEnvelopeExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const envelope_dto_1 = require("../dto/envelope.dto");
let HttpEnvelopeExceptionFilter = class HttpEnvelopeExceptionFilter {
    logger = new common_1.Logger('ExceptionFilter');
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const res = ctx.getResponse();
        const req = ctx.getRequest();
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let code = 'internal_error';
        let message = 'Internal Server Error';
        let details;
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const resp = exception.getResponse();
            if (typeof resp === 'string') {
                message = resp;
            }
            else if (typeof resp === 'object' && resp) {
                const r = resp;
                message = r.message || r.error || message;
                code = r.code || code;
                if (r.details)
                    details = r.details;
                if (Array.isArray(r.message)) {
                    details = { ...(details || {}), validationErrors: r.message };
                    message = 'Validation failed';
                    code = code === 'internal_error' ? 'validation_error' : code;
                }
            }
            if (status === common_1.HttpStatus.UNAUTHORIZED && code === 'internal_error')
                code = 'unauthorized';
            if (status === common_1.HttpStatus.FORBIDDEN && code === 'internal_error')
                code = 'forbidden';
            if (status === common_1.HttpStatus.NOT_FOUND && code === 'internal_error')
                code = 'not_found';
            if (status === common_1.HttpStatus.BAD_REQUEST && code === 'internal_error')
                code = 'bad_request';
        }
        const errorLog = {
            timestamp: new Date().toISOString(),
            path: req.url,
            method: req.method,
            statusCode: status,
            code,
            message,
            details,
        };
        if (status >= 500) {
            this.logger.error(`${req.method} ${req.url} - ${status} ${code}: ${message}`, exception instanceof Error ? exception.stack : JSON.stringify(exception));
        }
        else if (status >= 400) {
            this.logger.warn(`${req.method} ${req.url} - ${status} ${code}: ${message}`, JSON.stringify(details || {}));
        }
        res.status(status).json((0, envelope_dto_1.err)(code, message, details));
    }
};
exports.HttpEnvelopeExceptionFilter = HttpEnvelopeExceptionFilter;
exports.HttpEnvelopeExceptionFilter = HttpEnvelopeExceptionFilter = __decorate([
    (0, common_1.Catch)()
], HttpEnvelopeExceptionFilter);
//# sourceMappingURL=http-exception.filter.js.map