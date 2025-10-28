import { HttpException } from '@nestjs/common';
export declare class ContentPolicyException extends HttpException {
    constructor(message: string);
}
