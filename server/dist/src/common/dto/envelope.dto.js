"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeMeta = makeMeta;
exports.ok = ok;
exports.err = err;
function makeMeta() {
    return {
        requestId: Math.random().toString(16).slice(2, 10),
        timestamp: new Date().toISOString(),
    };
}
function ok(data) {
    return { success: true, data, meta: makeMeta() };
}
function err(code, message, details) {
    return { success: false, error: { code, message, details }, meta: makeMeta() };
}
//# sourceMappingURL=envelope.dto.js.map