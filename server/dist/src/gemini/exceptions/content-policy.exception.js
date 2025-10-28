"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentPolicyException = void 0;
const common_1 = require("@nestjs/common");
class ContentPolicyException extends common_1.HttpException {
    constructor(message) {
        super({
            success: false,
            error: {
                code: 'inappropriate_content',
                message,
            },
        }, common_1.HttpStatus.UNPROCESSABLE_ENTITY);
    }
}
exports.ContentPolicyException = ContentPolicyException;
//# sourceMappingURL=content-policy.exception.js.map