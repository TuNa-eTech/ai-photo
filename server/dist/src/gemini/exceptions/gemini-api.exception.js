"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiAPIException = void 0;
const common_1 = require("@nestjs/common");
class GeminiAPIException extends common_1.HttpException {
    constructor(message, status = common_1.HttpStatus.BAD_GATEWAY) {
        super({
            success: false,
            error: {
                code: 'gemini_api_error',
                message,
            },
        }, status);
    }
}
exports.GeminiAPIException = GeminiAPIException;
//# sourceMappingURL=gemini-api.exception.js.map