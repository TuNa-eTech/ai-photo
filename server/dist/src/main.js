"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const envelope_interceptor_1 = require("./common/interceptors/envelope.interceptor");
const logging_interceptor_1 = require("./common/interceptors/logging.interceptor");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
async function bootstrap() {
    const logLevels = process.env.NODE_ENV === 'production'
        ? ['error', 'warn', 'log']
        : ['error', 'warn', 'log', 'debug', 'verbose'];
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: logLevels,
    });
    const logger = new common_1.Logger('Bootstrap');
    app.useGlobalPipes(new common_1.ValidationPipe({ transform: true, whitelist: true, forbidUnknownValues: false }));
    app.useGlobalInterceptors(new logging_interceptor_1.LoggingInterceptor());
    app.useGlobalInterceptors(new envelope_interceptor_1.EnvelopeInterceptor());
    app.useGlobalFilters(new http_exception_filter_1.HttpEnvelopeExceptionFilter());
    const corsOrigins = (process.env.CORS_ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
    app.enableCors({
        origin: corsOrigins.length > 0 ? corsOrigins : true,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Authorization', 'Content-Type'],
    });
    const port = Number(process.env.PORT || 8080);
    await app.listen(port);
    logger.log(`🚀 Server is running on http://localhost:${port}`);
    logger.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.log(`🔐 CORS Origins: ${corsOrigins.length > 0 ? corsOrigins.join(', ') : 'All origins'}`);
    logger.log(`🔑 DevAuth: ${process.env.DEV_AUTH_ENABLED === '1' ? 'ENABLED ⚠️' : 'DISABLED (Firebase Auth)'}`);
}
bootstrap();
//# sourceMappingURL=main.js.map