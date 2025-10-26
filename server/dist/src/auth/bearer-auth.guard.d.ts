import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class BearerAuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): Promise<boolean>;
}
