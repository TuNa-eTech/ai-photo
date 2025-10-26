import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Envelope, ok } from '../dto/envelope.dto';

@Injectable()
export class EnvelopeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data: any): Envelope<any> => {
        // If handler already returned an envelope, pass through
        if (data && typeof data === 'object' && 'success' in data) {
          return data as Envelope<any>;
        }
        // Wrap plain data into success envelope
        return ok(data);
      }),
    );
  }
}
