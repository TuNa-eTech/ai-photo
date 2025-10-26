import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
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
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request & { headers: Record<string, string | undefined> }>();
    const devEnabled = parseBool(process.env.DEV_AUTH_ENABLED);
    const expected = (process.env.DEV_AUTH_TOKEN || '').trim();

    const auth = (req.headers['authorization'] || (req.headers['Authorization'] as any)) as string | undefined;
    if (!auth || !auth.startsWith('Bearer ')) {
      throw new UnauthorizedException({ code: 'unauthorized', message: 'Missing or invalid Authorization header' });
    }
    const token = auth.substring('Bearer '.length).trim();

    // DevAuth path
    if (devEnabled) {
      if (!expected || token !== expected) {
        throw new UnauthorizedException({ code: 'unauthorized', message: 'Invalid token' });
      }
      return true;
    }

    // Firebase verification path
    try {
      initFirebaseAdmin();
      const authAdmin = getAuth();
      await authAdmin.verifyIdToken(token);
      return true;
    } catch {
      throw new UnauthorizedException({ code: 'unauthorized', message: 'Invalid or expired token' });
    }
  }
}
