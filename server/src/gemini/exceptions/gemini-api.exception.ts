import { HttpException, HttpStatus } from '@nestjs/common';

export class GeminiAPIException extends HttpException {
  constructor(message: string, status: number = HttpStatus.BAD_GATEWAY) {
    super(
      {
        success: false,
        error: {
          code: 'gemini_api_error',
          message,
        },
      },
      status,
    );
  }
}

