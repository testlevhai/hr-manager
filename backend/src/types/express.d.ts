import type { AuthUser } from './auth.ts';

declare global {
  namespace Express {
    interface Request {
      authUser: AuthUser;
    }
  }
}
