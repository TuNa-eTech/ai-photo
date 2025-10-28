"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('gemini', () => ({
    apiKey: process.env.GEMINI_API_KEY,
    baseUrl: process.env.GEMINI_API_BASE_URL || 'https://generativelanguage.googleapis.com',
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash-image',
    timeoutMs: parseInt(process.env.GEMINI_TIMEOUT_MS || '45000', 10),
}));
//# sourceMappingURL=gemini.config.js.map