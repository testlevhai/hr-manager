import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { env } from '../env.ts';
import { AppError } from '../errors.ts';
import { ERROR_CODE } from '../constants/errorCodes.ts';
import { STRINGS } from '../constants/strings.ts';
import { upsertUserByGoogleSub } from '../db/usersDb.ts';
import type { AuthUser, LoginResult } from '../types/auth.ts';

const JWT_EXPIRES_IN = '7d';
const DEV_GOOGLE_SUB_PREFIX = 'dev:';

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

const signToken = (user: AuthUser): string =>
  jwt.sign({ email: user.email, name: user.name }, env.JWT_SECRET, {
    subject: String(user.id),
    expiresIn: JWT_EXPIRES_IN,
  });

export const loginWithGoogle = async (idToken: string): Promise<LoginResult> => {
  const unauthorized = new AppError(401, ERROR_CODE.UNAUTHORIZED, STRINGS.INVALID_GOOGLE_TOKEN);

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch {
    throw unauthorized;
  }

  if (!payload?.email || !payload.email_verified) {
    throw unauthorized;
  }

  const user = await upsertUserByGoogleSub(payload.sub, payload.email, payload.name ?? payload.email);
  return { token: signToken(user), user };
};

export const loginAsDevUser = async (email: string): Promise<LoginResult> => {
  if (!env.ALLOW_DEV_LOGIN) {
    throw new AppError(404, ERROR_CODE.NOT_FOUND, STRINGS.DEV_LOGIN_DISABLED);
  }

  const user = await upsertUserByGoogleSub(`${DEV_GOOGLE_SUB_PREFIX}${email}`, email, email);
  return { token: signToken(user), user };
};
