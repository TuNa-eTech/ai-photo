import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { getAuth } from 'firebase-admin/auth';
import { initFirebaseAdmin } from './firebase-admin';

function parseBool(v: any): boolean {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase();
    return s === '1' || s === 'true' || s === 'yes' || s === 'on';
  }
  return false;
}

@Injectable()
export class BearerAuthGuard implements CanActivate {
  private readonly logger = new Logger('BearerAuthGuard');

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request & { headers: Record<string, string | undefined>; firebaseUid?: string; url?: string }>();
    const devEnabled = parseBool(process.env.DEV_AUTH_ENABLED);
    const expected = (process.env.DEV_AUTH_TOKEN || '').trim();

    const auth = (req.headers['authorization'] || (req.headers['Authorization'] as any)) as string | undefined;
    if (!auth || !auth.startsWith('Bearer ')) {
      this.logger.warn(`Missing or invalid Authorization header for ${req.url}`);
      throw new UnauthorizedException({ code: 'unauthorized', message: 'Missing or invalid Authorization header' });
    }
    const token = auth.substring('Bearer '.length).trim();

    // DevAuth path
    if (devEnabled) {
      if (!expected || token !== expected) {
        this.logger.warn(`Invalid DevAuth token for ${req.url}`);
        throw new UnauthorizedException({ code: 'unauthorized', message: 'Invalid token' });
      }
      // For dev mode, use a fixed test UID
      req.firebaseUid = 'dev-user-uid-123';
      this.logger.debug(`DevAuth: Authenticated as dev-user-uid-123 for ${req.url}`);
      return true;
    }

    // Firebase verification path
    try {
      initFirebaseAdmin();
      const authAdmin = getAuth();
      const decodedToken = await authAdmin.verifyIdToken(token);
      // Attach Firebase UID to request for use in controllers
      req.firebaseUid = decodedToken.uid;
      this.logger.debug(`Firebase Auth: Authenticated user ${decodedToken.uid} for ${req.url}`);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Firebase token verification failed for ${req.url}: ${errorMessage}`);
      throw new UnauthorizedException({ code: 'unauthorized', message: 'Invalid or expired token' });
    }
  }
}
