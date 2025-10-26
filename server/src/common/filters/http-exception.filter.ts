import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { err } from '../dto/envelope.dto';

@Catch()
export class HttpEnvelopeExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'internal_error';
    let message = 'Internal Server Error';
    let details: Record<string, any> | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const resp = exception.getResponse();
      // Normalize Nest/Validation error shapes
      if (typeof resp === 'string') {
        message = resp;
      } else if (typeof resp === 'object' && resp) {
        const r: any = resp;
        message = r.message || r.error || message;
        code = (r.code as string) || code;
        if (r.details) details = r.details;
        // include validation errors if present
        if (Array.isArray(r.message)) {
          details = { ...(details || {}), validationErrors: r.message };
          message = 'Validation failed';
          code = code === 'internal_error' ? 'validation_error' : code;
        }
      }
      // Map common statuses to codes
      if (status === HttpStatus.UNAUTHORIZED && code === 'internal_error') code = 'unauthorized';
      if (status === HttpStatus.FORBIDDEN && code === 'internal_error') code = 'forbidden';
      if (status === HttpStatus.NOT_FOUND && code === 'internal_error') code = 'not_found';
      if (status === HttpStatus.BAD_REQUEST && code === 'internal_error') code = 'bad_request';
    }

    res.status(status).json(err(code, message, details));
  }
}
