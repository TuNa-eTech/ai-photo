import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { EnvelopeInterceptor } from './common/interceptors/envelope.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { HttpEnvelopeExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  // Configure logger level based on environment
  const logLevels: Array<'log' | 'error' | 'warn' | 'debug' | 'verbose'> = process.env.NODE_ENV === 'production'
    ? ['error', 'warn', 'log']
    : ['error', 'warn', 'log', 'debug', 'verbose'];

  const app = await NestFactory.create(AppModule, {
    logger: logLevels,
  });

  const logger = new Logger('Bootstrap');

  // Global validation
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidUnknownValues: false }));

  // Global interceptors (logging first, then envelope)
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalInterceptors(new EnvelopeInterceptor());
  app.useGlobalFilters(new HttpEnvelopeExceptionFilter());

  // CORS configuration from env
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
