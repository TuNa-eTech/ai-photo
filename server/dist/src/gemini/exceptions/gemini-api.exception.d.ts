import { HttpException } from '@nestjs/common';
export declare class GeminiAPIException extends HttpException {
    constructor(message: string, status?: number);
}
