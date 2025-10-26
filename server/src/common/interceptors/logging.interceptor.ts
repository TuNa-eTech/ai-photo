import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Logging interceptor for request/response logging
 * Logs all incoming requests and their responses
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    const { method, url, body, headers } = req;
    const userAgent = headers['user-agent'] || 'Unknown';
    const ip = headers['x-forwarded-for'] || req.connection.remoteAddress || 'Unknown';

    const now = Date.now();

    // Log incoming request
    this.logger.log(`→ ${method} ${url} - ${ip} - ${userAgent}`);

    // Log request body for POST/PUT/PATCH (excluding sensitive fields)
    if (['POST', 'PUT', 'PATCH'].includes(method) && body) {
      const sanitizedBody = this.sanitizeBody(body);
      this.logger.debug(`  Body: ${JSON.stringify(sanitizedBody)}`);
    }

    return next.handle().pipe(
      tap({
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
      }),
    );
  }

  /**
   * Sanitize request body to hide sensitive fields
   */
  private sanitizeBody(body: any): any {
    if (!body || typeof body !== 'object') return body;

    const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'private_key', 'privateKey'];
    const sanitized = { ...body };

    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '***REDACTED***';
      }
    }

    return sanitized;
  }
}

