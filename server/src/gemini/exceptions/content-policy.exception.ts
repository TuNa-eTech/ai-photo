import { HttpException, HttpStatus } from '@nestjs/common';

export class ContentPolicyException extends HttpException {
  constructor(message: string) {
    super(
      {
        success: false,
        error: {
          code: 'inappropriate_content',
          message,
        },
      },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
}
