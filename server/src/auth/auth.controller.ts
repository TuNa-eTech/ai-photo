import { Controller, Get, UseGuards, Header } from '@nestjs/common';
import { BearerAuthGuard } from './bearer-auth.guard';
import { AdminGuard } from './admin.guard';

/**
 * Auth Controller
 * Handles authentication and authorization verification
 */
@Controller('v1/auth')
export class AuthController {
  /**
   * GET /v1/auth/verify-admin
   * Verify if current user has admin privileges
   * Used by web-cms to validate admin access after Firebase login
   */
  @Get('verify-admin')
  @UseGuards(BearerAuthGuard, AdminGuard)
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  @Header('Pragma', 'no-cache')
  @Header('Expires', '0')
  async verifyAdmin() {
    return {
      isAdmin: true,
      message: 'User has admin privileges',
    };
  }
}
