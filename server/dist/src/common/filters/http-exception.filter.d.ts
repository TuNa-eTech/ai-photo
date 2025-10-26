import { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
export declare class HttpEnvelopeExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost): void;
}
