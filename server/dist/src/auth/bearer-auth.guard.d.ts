import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class BearerAuthGuard implements CanActivate {
    private readonly logger;
    canActivate(context: ExecutionContext): Promise<boolean>;
}
