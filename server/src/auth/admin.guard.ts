import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  ForbiddenException,
} from '@nestjs/common';

function parseBool(v: any): boolean {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase();
    return s === '1' || s === 'true' || s === 'yes' || s === 'on';
  }
  return false;
}

/**
 * AdminGuard
 * 
 * Validates that the authenticated user's email is in the ADMIN_EMAILS whitelist.
 * Must be used after BearerAuthGuard.
 * 
 * Environment Variables:
 * - ADMIN_EMAILS: Comma-separated list of admin email addresses
 * - DEV_AUTH_ENABLED: If true, dev users are always allowed
 */
@Injectable()
export class AdminGuard implements CanActivate {
  private readonly logger = new Logger('AdminGuard');

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<
      Request & {
        userEmail?: string;
        url?: string;
      }
    >();

    const devEnabled = parseBool(process.env.DEV_AUTH_ENABLED);
    
    // In dev mode, always allow
    if (devEnabled) {
      this.logger.debug(`DevAuth: Admin access granted for ${req.url}`);
      return true;
    }

    const userEmail = req.userEmail;
    
    if (!userEmail) {
      this.logger.warn(`No user email found in request for ${req.url}`);
      throw new ForbiddenException({
        code: 'forbidden',
        message: 'Admin access required. User email not found.',
      });
    }

    const adminEmailsStr = (process.env.ADMIN_EMAILS || '').trim();
    
    if (!adminEmailsStr) {
      this.logger.error('ADMIN_EMAILS environment variable not configured');
      throw new ForbiddenException({
        code: 'forbidden',
        message: 'Admin access not configured. Contact system administrator.',
      });
    }

    // Parse admin emails (comma-separated, trim whitespace)
    const adminEmails = adminEmailsStr
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter((email) => email.length > 0);

    const isAdmin = adminEmails.includes(userEmail.toLowerCase());

    this.logger.debug(`Checking admin access for: ${userEmail}`);
    this.logger.debug(`Admin whitelist: ${JSON.stringify(adminEmails)}`);
    this.logger.debug(`Is Admin: ${isAdmin}`);

    if (!isAdmin) {
      this.logger.warn(
        `Access denied for ${userEmail} to ${req.url}. Not in admin whitelist.`,
      );
      throw new ForbiddenException({
        code: 'forbidden',
        message: 'Admin access required. Your account does not have admin privileges.',
      });
    }

    this.logger.debug(`Admin access granted for ${userEmail} to ${req.url}`);
    return true;
  }
}
